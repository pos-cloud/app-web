export type EmailProps = {
  to: string;
  subject: string;
  body: string;
  attachments: string[];
};

export enum ORIGINMEDIA {
  ARTICLES = 'articles',
  CATEGORIES = 'categories',
  MAKES = 'makes',
  COMPANY = 'configs',
  RESOURCES = 'resources',
}
