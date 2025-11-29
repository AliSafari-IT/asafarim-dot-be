package be.asafarim.learn.javanotesapi.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugGenerator {
    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-+");

    public static String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = normalized.toLowerCase(Locale.ENGLISH);
        slug = WHITESPACE.matcher(slug).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = MULTIPLE_DASHES.matcher(slug).replaceAll("-");
        slug = slug.replaceAll("^-+|-+$", "");

        if (slug.length() > 100) {
            slug = slug.substring(0, 100);
            slug = slug.replaceAll("-+$", "");
        }

        return slug;
    }

    public static String makeUnique(String baseSlug, int attempt) {
        if (attempt <= 1) {
            return baseSlug;
        }
        return baseSlug + "-" + attempt;
    }
}
