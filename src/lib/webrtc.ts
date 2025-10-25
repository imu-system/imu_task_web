
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { CallSignal, IceCandidateSignal } from './types';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCService {
  private pc: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStream: (stream: MediaStream) => void;
  private callId: string | null = null;
  private threadId: string;

  constructor(threadId: string, onRemoteStream: (stream: MediaStream) => void) {
    this.pc = new RTCPeerConnection(servers);
    this.threadId = threadId;
    this.onRemoteStream = onRemoteStream;
  }

  async getMedia() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.remoteStream = new MediaStream();

    this.localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, this.localStream!);
    });

    this.pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
      });
      if (this.remoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    return this.localStream;
  }

  async startCall() {
    const callDoc = doc(collection(db, 'threads', this.threadId, 'calls'));
    this.callId = callDoc.id;

    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    this.pc.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    const offerDescription = await this.pc.createOffer();
    await this.pc.setLocalDescription(offerDescription);

    const offer: CallSignal = {
      sdp: offerDescription.sdp!,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!this.pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.pc.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          this.pc.addIceCandidate(candidate);
        }
      });
    });

    return this.callId;
  }

  async answerCall(callId: string) {
    this.callId = callId;
    const callDoc = doc(db, 'threads', this.threadId, 'calls', callId);
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    this.pc.onicecandidate = (event) => {
      event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = (await getDoc(callDoc)).data();
    if (callData?.offer) {
      const offerDescription = new RTCSessionDescription(callData.offer);
      await this.pc.setRemoteDescription(offerDescription);

      const answerDescription = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answerDescription);

      const answer: CallSignal = {
        sdp: answerDescription.sdp!,
        type: answerDescription.type,
      };

      await updateDoc(callDoc, { answer });

      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            let data = change.doc.data();
            this.pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    }
  }

  async hangUp() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.pc.close();

    if (this.callId) {
      const callDoc = doc(db, 'threads', this.threadId, 'calls', this.callId);
      const offerCandidates = await getDocs(collection(callDoc, 'offerCandidates'));
      offerCandidates.forEach(async (candidate) => await deleteDoc(candidate.ref));
      const answerCandidates = await getDocs(collection(callDoc, 'answerCandidates'));
      answerCandidates.forEach(async (candidate) => await deleteDoc(candidate.ref));
      await deleteDoc(callDoc);
    }
  }
}
