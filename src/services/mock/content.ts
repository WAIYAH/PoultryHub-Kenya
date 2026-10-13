import { blogPosts } from "@/mocks/fixtures/blog";
import {
  aboutContent,
  faqs,
  homeContent,
  serviceOfferings,
  siteSettings,
  testimonials,
} from "@/mocks/fixtures/content";
import { policies } from "@/mocks/fixtures/policies";
import type { BlogPost, BlogPostSummary } from "@/types/domain";

import type { ContentService } from "../contracts";

import { mockRequest } from "./latency";

export function toPostSummary(post: BlogPost): BlogPostSummary {
  const { bodyMarkdown: _body, authorName: _author, ...summary } = post;
  return summary;
}

/** Newest first; posts scheduled for the future stay hidden until their date (DATABASE.md §4.8). */
export function publishedPosts(now: number = Date.now()): BlogPost[] {
  return blogPosts
    .filter((post) => Date.parse(post.publishedAt) <= now)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function createMockContentService(): ContentService {
  return {
    async getSettings() {
      await mockRequest();
      return structuredClone(siteSettings);
    },

    async getHome() {
      await mockRequest();
      return structuredClone(homeContent);
    },

    async getAbout() {
      await mockRequest();
      return structuredClone(aboutContent);
    },

    async listServices() {
      await mockRequest();
      return serviceOfferings.filter((service) => service.offered);
    },

    async listFaqs(filter = {}) {
      const scenarios = await mockRequest();
      if (scenarios.has("empty")) return [];
      return faqs
        .filter((faq) => !filter.topic || faq.topic === filter.topic)
        .filter((faq) => !filter.homeOnly || faq.showOnHome);
    },

    async listTestimonials() {
      await mockRequest();
      return structuredClone(testimonials);
    },

    async listPosts(query = {}) {
      const scenarios = await mockRequest();
      const { page = 1, pageSize = 9, tag } = query;
      if (scenarios.has("empty")) return { items: [], total: 0, page, pageSize };
      const posts = publishedPosts().filter((post) => !tag || post.tags.includes(tag));
      const start = (page - 1) * pageSize;
      return {
        items: posts.slice(start, start + pageSize).map(toPostSummary),
        total: posts.length,
        page,
        pageSize,
      };
    },

    async getPost(slug) {
      await mockRequest();
      return publishedPosts().find((post) => post.slug === slug) ?? null;
    },

    async listRelatedPosts(slug, limit = 3) {
      const scenarios = await mockRequest();
      if (scenarios.has("empty")) return [];
      const posts = publishedPosts();
      const current = posts.find((post) => post.slug === slug);
      const shared = (post: BlogPost) =>
        current ? post.tags.filter((tag) => current.tags.includes(tag)).length : 0;
      return posts
        .filter((post) => post.slug !== slug)
        .sort((a, b) => shared(b) - shared(a))
        .slice(0, limit)
        .map(toPostSummary);
    },

    async getPolicy(slug) {
      await mockRequest();
      return policies.find((page) => page.slug === slug) ?? null;
    },
  };
}
