module.exports = function (eleventyConfig) {
    eleventyConfig.addFilter("sortByWeek", function (values) {
        let vals = [...values]; // this *seems* to prevent collection mutation...

        return [...vals.sort((a, b) => Math.sign(a.data.week - b.data.week))];
    });

    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js/paged");

    return {
        dir: {
            // ⚠️ These values are both relative to your input directory.
            includes: "_includes",
            layouts: "_layouts",
        },
    };
};
