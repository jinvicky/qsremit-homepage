package com.nnp.qsremit.validation.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Cleaner;
import org.jsoup.safety.Safelist;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SafeQuillHtml.Validator.class)
public @interface SafeQuillHtml {

    String message() default "Unsafe HTML content detected";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    class Validator implements ConstraintValidator<SafeQuillHtml, String> {
        private static final Safelist QUILL_WHITELIST = Safelist.relaxed()
                .addTags("span")
                .addAttributes("span", "style", "class")
                .addAttributes("a", "target")
                .addAttributes("img", "data-placeholder", "class")
                .addProtocols("img", "src", "data")
                .preserveRelativeLinks(true);

        @Override
        public boolean isValid(String value, ConstraintValidatorContext context) {
            if (value == null || value.isEmpty()) {
                return true;
            }

            if (value.matches("(?i).*<img[^>]+src\\s*=\\s*['\"]?(javascript:|vbscript:|data:text/).*")) {
                return false;
            }

            System.out.println("=== 입력 HTML ===");
            System.out.println(value);

            Document dirty = Jsoup.parse(value);
            dirty.outputSettings().prettyPrint(false);

            Cleaner cleaner = new Cleaner(QUILL_WHITELIST);
            Document clean = cleaner.clean(dirty);
            clean.outputSettings().prettyPrint(false);

            String cleanedHtml = clean.body().html();
            String originalHtml = dirty.body().html();


            // ✅ 디버깅: 정제 후 출력 (임시)
            System.out.println("=== 정제 HTML ===");
            System.out.println(cleanedHtml);
            System.out.println("=== 비교 결과 ===");
            System.out.println("동일: " + cleanedHtml.replaceAll("\\s+", "").equals(originalHtml.replaceAll("\\s+", "")));

            return cleanedHtml.replaceAll("\\s+", "").equals(originalHtml.replaceAll("\\s+", ""));
        }
    }
}
