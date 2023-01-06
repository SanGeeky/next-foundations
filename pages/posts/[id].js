import Head from 'next/head';
import { getArticleIds, getArticle } from '../../lib/posts';
import Layout from '../../components/layout';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css'

export default function Post({ articleData }) {
  return (
    <Layout>
      <Head>
        <title>{articleData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{articleData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={articleData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: articleData.content }} />
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = await getArticleIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const articleData = await getArticle(params.id);
  return {
    props: {
      articleData,
    },
  };
}
