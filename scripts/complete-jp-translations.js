#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const frPath = path.join(messagesDir, 'fr.json');
const enPath = path.join(messagesDir, 'en.json');
const jpPath = path.join(messagesDir, 'jp.json');

const frData = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const jpData = JSON.parse(fs.readFileSync(jpPath, 'utf8'));

// Fonction pour obtenir une valeur via un chemin de clé
function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Fonction pour définir une valeur via un chemin de clé
function setValueByPath(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Traduire du français vers le japonais (traductions approximatives)
const translations = {
  // Sections manquantes principales
  'PartnershipsPage': 'パートナーシップページ',
  'AvailabilityPage': '利用可能性ページ',
  'ProfilePage': 'プロフィールページ',
  'BookingDetailPage': '予約詳細ページ',
  'ProviderOffersPage': 'プロバイダーオファーページ',
  'MyBookingsPage': '私の予約ページ',
  'TaskActions': 'タスクアクション',
  'SearchPage': '検索ページ',
  'AdminAcademyPage': '管理者アカデミーページ',
  'AvailabilitySettingsPage': '利用可能性設定ページ',
  'AcademyPage': 'アカデミーページ',
  'AcademyDetailPage': 'アカデミー詳細ページ',
  'AddressForm': '住所フォーム',
  'ProviderCard': 'プロバイダーカード',
  'MessagesPage': 'メッセージページ',
  'AttachmentPreview': '添付プレビュー',
  
  // Mots communs
  'title': 'タイトル',
  'subtitle': 'サブタイトル',
  'description': '説明',
  'button': 'ボタン',
  'save': '保存',
  'cancel': 'キャンセル',
  'delete': '削除',
  'edit': '編集',
  'create': '作成',
  'update': '更新',
  'back': '戻る',
  'next': '次へ',
  'previous': '前へ',
  'submit': '送信',
  'confirm': '確認',
  'close': '閉じる',
  'loading': '読み込み中...',
  'error': 'エラー',
  'success': '成功',
  'warning': '警告',
  'info': '情報',
  'name': '名前',
  'email': 'メール',
  'password': 'パスワード',
  'phone': '電話',
  'address': '住所',
  'city': '都市',
  'country': '国',
  'date': '日付',
  'time': '時間',
  'price': '価格',
  'total': '合計',
  'status': 'ステータス',
  'active': 'アクティブ',
  'inactive': '非アクティブ',
  'pending': '保留中',
  'completed': '完了',
  'cancelled': 'キャンセル済み',
  'available': '利用可能',
  'unavailable': '利用不可',
  'accept': '受け入れる',
  'reject': '拒否',
  'approve': '承認',
  'decline': '辞退',
  'view': '表示',
  'download': 'ダウンロード',
  'upload': 'アップロード',
  'search': '検索',
  'filter': 'フィルター',
  'sort': '並べ替え',
  'settings': '設定',
  'profile': 'プロフィール',
  'dashboard': 'ダッシュボード',
  'notifications': '通知',
  'messages': 'メッセージ',
  'help': 'ヘルプ',
  'support': 'サポート',
  'contact': '連絡先',
  'about': '概要',
  'terms': '利用規約',
  'privacy': 'プライバシー',
  'logout': 'ログアウト',
  'login': 'ログイン',
  'register': '登録',
  'signin': 'サインイン',
  'signup': 'サインアップ',
};

// Simple traduction basée sur les mots anglais
function simpleTranslate(text) {
  if (typeof text !== 'string') return text;
  
  // Chercher des correspondances exactes
  for (const [en, jp] of Object.entries(translations)) {
    if (text.toLowerCase().includes(en.toLowerCase())) {
      return text; // Pour l'instant, on garde l'anglais si pas de traduction exacte
    }
  }
  return text;
}

// Copier les clés manquantes depuis l'anglais
function copyMissingKeys(source, target) {
  for (const [key, value] of Object.entries(source)) {
    if (!(key in target)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        target[key] = {};
        copyMissingKeys(value, target[key]);
      } else {
        // Copier la valeur anglaise comme placeholder
        target[key] = value; // On garde l'anglais pour révision manuelle
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      copyMissingKeys(value, target[key]);
    }
  }
}

// Copier les sections manquantes
copyMissingKeys(enData, jpData);

// Sauvegarder le fichier japonais mis à jour
fs.writeFileSync(jpPath, JSON.stringify(jpData, null, 4) + '\n', 'utf8');

console.log('✅ Traductions japonaises complétées avec les valeurs anglaises comme placeholders');
console.log('📝 Veuillez réviser et traduire manuellement les sections ajoutées');
