import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');
const foremURL = 'https://dev.to/api/articles';

export async function getArticlesData() {
  const response = await fetch(foremURL.concat('?per_page=5'), { method: 'GET' });
  const articles = response
    .json()
    .then((articles) =>
      articles.map(
        ({ id, published_at: date, title, tag_list, user: { username } }) => {
          articleIds.push(id);

          return {
            id,
            date,
            title,
            username,
            tag_list,
          };
        }
      )
    )
    .catch((err) => {
      console.log(err);
    });

  return articles;
}

export async function getArticleIds() {
  const response = await fetch(foremURL.concat('?per_page=5'), { method: 'GET' });
  const articleIds = response
    .json()
    .then((articles) =>
      articles.map(({ id }) => {
        return {
          params: {
            id: id.toString(),
          },
        };
      })
    )
    .catch((err) => {
      console.log(err);
    });

  return articleIds;
}

export async function getArticle(id) {
  const response = await fetch(foremURL.concat(`/${id}`), { method: 'GET' });
  const article = response
    .json()
    .then(({ title, published_at: date, body_html: content }) => {
      return {
        id,
        title,
        date,
        content,
      };
    })
    .catch((err) => {
      console.log(err);
    });

  return article;
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
