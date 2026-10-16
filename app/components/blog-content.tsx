"use client";

import { useState } from "react";
import { blogPosts } from "../data/blog-posts";
import PublicPageShell from "./public-page-shell";
import CareIcon from "./care-icon";
import styles from "./public-pages.module.css";
import FallbackImage from "./fallback-image";

const pageSize = 12;

export default function BlogContent() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const posts = blogPosts.filter(post => post.title.toLowerCase().includes(term));
  const pageCount = Math.ceil(posts.length / pageSize);
  const visible = posts.slice((page-1)*pageSize,page*pageSize);

  // Form extensions can add fdprocessedid before hydration on search and pagination controls.
  return <PublicPageShell showBottomNavigation showBackButton pageTitle="Blog" hidePageNavigation search={<form className={`${styles.navSearch} ca-nav-search`} data-blog-search role="search" onSubmit={event => event.preventDefault()}>
    <button suppressHydrationWarning type="submit" aria-label="Search blogs"><CareIcon name="search" size={19}/></button>
    <input suppressHydrationWarning type="search" aria-label="Search blog articles" placeholder="Search blog articles..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/>
    {query && <button type="button" aria-label="Clear blog search" onClick={() => { setQuery(""); setPage(1); }}><CareIcon name="close" size={17}/></button>}
  </form>}>
    <header className={styles.blogHeader}><img className={styles.blogHeaderImage} src="/blog/merabetta-blog-hero.webp" alt="A senior couple reading wellness information together at home" width={2048} height={768} fetchPriority="high"/><div className={styles.blogHeaderCopy}><p className={styles.eyebrow}>The Merabetta Blog</p><h1 className={styles.heading}>Ideas, stories, and everyday wellbeing</h1><p className={styles.text}>Thoughtful guidance, practical health ideas, and inspiring stories for a healthier life at every age.</p></div></header>
    <p className={styles.sourceNote} role="status">{posts.length} {posts.length === 1 ? "article" : "articles"}{term ? ` matching “${query.trim()}”` : ""} · Page {pageCount ? page : 0} of {pageCount}</p>
    {posts.length === 0 && <div className={styles.empty}>No articles found. Try another keyword or <button className={styles.clearSearch} type="button" onClick={() => { setQuery(""); setPage(1); }}>clear your search</button>.</div>}
    <div className={styles.blogGrid}>{visible.map(post=><article className={styles.post} key={post.id}><FallbackImage className={styles.postImage} src={post.image} fallback="/blog/merabetta-blog-hero.webp" alt="" loading="lazy"/><div className={styles.postBody}><time dateTime={post.date}>{new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}</time><h2>{post.title}</h2><a href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`Read original article: ${post.title} (opens in new tab)`}>Read original article ↗</a></div></article>)}</div>
    {pageCount>1 && <nav className={styles.pagination} aria-label="Blog pagination">{Array.from({length:pageCount},(_,index)=><button suppressHydrationWarning key={index} aria-label={`Page ${index+1}`} aria-current={page===index+1 ? "page" : undefined} onClick={()=>{setPage(index+1);document.getElementById("public-content")?.scrollIntoView({behavior:"instant"});}}>{index+1}</button>)}</nav>}
    <p className={styles.sourceNote}>Article titles and images are from <a href="https://blog.merabetta.com/" target="_blank" rel="noopener noreferrer">the Merabetta blog</a>. Full article text is hosted by the original publisher.</p>
  </PublicPageShell>;
}
