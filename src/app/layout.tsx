// This is a RootLayout that contains server components.
// We can't use `useParams` here.
// See: https://next-intl-docs.vercel.app/docs/getting-started/app-router#layouts-and-not-found

import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default function RootLayout({children, params}: Props) {
  return children;
}
