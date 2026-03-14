export function registerHelpers(Handlebars) {
  // pascalCase: user-profile → UserProfile
  Handlebars.registerHelper("pascalCase", (str) => {
    return str
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\s+/g, "");
  });

  // camelCase: user-profile → userProfile
  Handlebars.registerHelper("camelCase", (str) => {
    const pascal = str
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\s+/g, "");
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  });

  // kebabCase: UserProfile → user-profile
  Handlebars.registerHelper("kebabCase", (str) => {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  });

  // snakeCase: UserProfile → user_profile
  Handlebars.registerHelper("snakeCase", (str) => {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase();
  });

  // eq: equality comparison for conditionals
  Handlebars.registerHelper("eq", (a, b) => a === b);

  // neq: not-equal comparison
  Handlebars.registerHelper("neq", (a, b) => a !== b);
}
