# future-past

This is an attempt at a reader for a course at Sydney University

It's some markdown files in `_posts` that are merged into one big file through `index.hmtl` with a liquid loop.

It's paginated with paged.js

## To build

<!--
1. clone the repo
1. run `bundle install`
1. run `jekyll serve --incremental`
1. it's probably being served on `http://localhost:4000/` -->

1. `npx npx eleventy --input=. --output=docs --serve`

That should be it, but I've probably forgotten something
