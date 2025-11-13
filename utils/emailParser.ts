import { EmailContact } from '@/types';

export class EmailParser {
  static parseContent(content: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = content.match(emailRegex) || [];
    return [...new Set(emails.map(email => email.toLowerCase()))];
  }

  static async parseFile(file: File): Promise<{ emails: string[]; totalFound: number }> {
    const content = await this.readFileAsText(file);
    const emails = this.parseContent(content);
    return { emails, totalFound: emails.length };
  }

  static async parseMultipleFiles(files: File[]): Promise<{ emails: string[]; totalFound: number }> {
    const allEmails: string[] = [];
    
    for (const file of files) {
      const { emails } = await this.parseFile(file);
      allEmails.push(...emails);
    }

    const uniqueEmails = [...new Set(allEmails)];
    return { emails: uniqueEmails, totalFound: uniqueEmails.length };
  }

  static createContactsFromEmails(emails: string[]): EmailContact[] {
    const now = new Date();
    return emails.map(email => ({
      id: `contact-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      nickname: email.split('@')[0],
      tags: ['imported'],
      status: 'active',
      addedAt: now,
    }));
  }

  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
}