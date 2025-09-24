"use client";

import Head from "next/head";

export default function PageWrapper({ title, description, children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      {children}
    </>
  );
}
