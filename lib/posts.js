import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');
const foremURL = process.env.API_URL;
const pageSize = process.env.PAGE_SIZE;
const pageSizeParam = '?per_page=';

const queryURL = (id) =>
  !id ? `${foremURL}${pageSizeParam}${pageSize}` : `${foremURL}/${id}`;

export async function getArticlesData() {
  const url = queryURL();
  const response = await requestAPI(url);

  return response.map(
    ({ id, published_at: date, title, tag_list, user: { username } }) => {
      return {
        id,
        date,
        title,
        username,
        tag_list,
      };
    }
  );
}

export async function getArticleIds() {
  const url = queryURL();
  const response = await requestAPI(url);

  return response.map(({ id }) => {
    return {
      params: {
        id: id.toString(),
      },
    };
  });
}

export async function getArticle(id) {
  const url = queryURL(id);
  const {
    title,
    published_at: date,
    body_html: content,
  } = await requestAPI(url);

  return {
    id,
    title,
    date,
    content,
  };
}

async function requestAPI(url) {
  const response = await fetch(url, { method: 'GET' });
  const data = response
    .json()
    .then((data) => data)
    .catch((err) => {
      console.log(err);
    });

  return data;
}

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
