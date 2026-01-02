/**
 * 개발자 :
 * 개발일 :
 * 개발목적 : HTTP 처리 관련 유틸리티 메서드들을 모아둔 클래스.
 - 주요기능
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 최유진 / 2025년 08월 12일
 - 내용 : 주석 정리 및 양식에 맞게 재작성, html 특수문자 escape 처리 메소드 추가
 2. 수정자 / 일자 : 최유진 / 2025년 08월 13일
 - 내용 : OffsetDateTime 예외처리 추가, 특수 문자 처리 범위 확장, jsoup 메소드 활성화
 3. 수정자 / 일자 : 최유진 / 2025년 08월 19일
 - 내용 : unescape 처리 코드 추가
 */

package com.nnp.qsremit.service.util;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Component
public class HttpUtils {

    // ============================================================
    // HTML Client를 이용한 요청, 응답 처리
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .build();

    public static String getResponseBody(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (Exception e) {
            log.error("[HTTP ERROR] GET 요청 실패: {}", url, e);
            return null;
        }
    }
    // ============================================================

    // ============================================================
    // HTML 태그 삽입 방지 특수문자 escape 처리
    public String htmlEscape(String parameters) {
        if (parameters == null) return null;

        Map<String, String> map = new LinkedHashMap<>();
        map.put("&", "&amp;");  // 반드시 먼저 처리
//        map.put(";", "&#59;");
        map.put("<", "&lt;");
        map.put(">", "&gt;");
        map.put("\"", "&quot;");
        map.put("'", "&#39;");
        map.put("%", "&#37;");
//        map.put("(", "&#40;");
//        map.put(")", "&#41;");
        map.put("+", "&#43;");
        map.put("/", "&#47;");
        map.put("\\", "&#92;"); 
        map.put(",", "&#44;");

        StringBuilder result = new StringBuilder(parameters);
        for (Map.Entry<String, String> entry : map.entrySet()) {
            int start = result.indexOf(entry.getKey());
            while (start != -1) {
                result.replace(start, start + entry.getKey().length(), entry.getValue());
                start = result.indexOf(entry.getKey(), start + entry.getValue().length());
            }
        }
        return result.toString();
    }

    public Object escapeAllStrings(Object obj) {
        if (obj == null) return null;

        // String이면 바로 escape
        if (obj instanceof String s) {
            return htmlEscape(s);
        }

        // OffsetDateTime이면 그대로 반환
        if (obj instanceof OffsetDateTime) {
            return obj;
        }

        // Collection이면 내부 요소 재귀 처리
        if (obj instanceof Collection<?> collection) {
            List<Object> newList = new ArrayList<>();
            for (Object item : collection) {
                newList.add(escapeAllStrings(item));
            }
            return newList;
        }

        // 배열이면 내부 요소 재귀 처리
        if (obj.getClass().isArray()) {
            int length = Array.getLength(obj);
            for (int i = 0; i < length; i++) {
                Object element = Array.get(obj, i);
                Array.set(obj, i, escapeAllStrings(element));
            }
            return obj;
        }

        // Number, Boolean, Enum 등 단순 타입이면 그대로 반환
        if (obj instanceof Number || obj instanceof Boolean || obj instanceof Enum) {
            return obj;
        }

        // 일반 객체면 필드 순회
        for (Field field : obj.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            try {
                Object value = field.get(obj);
                if (value != null) {
                    field.set(obj, escapeAllStrings(value));
                }
            } catch (IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        }

        return obj;
    }

    public String htmlUnescape(String parameters) {
        if (parameters == null) return null;

        // Escape 시 사용한 매핑의 반대로 처리
        Map<String, String> map = new LinkedHashMap<>();
        map.put("&amp;", "&");  // 반드시 먼저 처리
//        map.put("&#59;", ";");
        map.put("&lt;", "<");
        map.put("&gt;", ">");
        map.put("&quot;", "\"");
        map.put("&#39;", "'");
        map.put("&#37;", "%");
//        map.put("&#40;", "(");
//        map.put("&#41;", ")");
        map.put("&#43;", "+");
        map.put("&#47;", "/");
        map.put("&#92;", "\\");
        map.put("&#44;", ",");

        StringBuilder result = new StringBuilder(parameters);
        for (Map.Entry<String, String> entry : map.entrySet()) {
            int start = result.indexOf(entry.getKey());
            while (start != -1) {
                result.replace(start, start + entry.getKey().length(), entry.getValue());
                start = result.indexOf(entry.getKey(), start + entry.getValue().length());
            }
        }
        return result.toString();
    }

    public Object unescapeAllStrings(Object obj) {
        if (obj == null) return null;

        // String이면 바로 unescape 처리
        if (obj instanceof String s) {
            return htmlUnescape(s);
        }

        // OffsetDateTime이면 그대로 반환
        if (obj instanceof OffsetDateTime) {
            return obj;
        }

        // Collection이면 내부 요소 재귀 처리
        if (obj instanceof Collection<?> collection) {
            for (Object item : collection) {
                unescapeAllStrings(item);
            }
            return collection;
        }

        // 배열이면 내부 요소 재귀 처리
        if (obj.getClass().isArray()) {
            int length = Array.getLength(obj);
            for (int i = 0; i < length; i++) {
                Object element = Array.get(obj, i);
                Array.set(obj, i, unescapeAllStrings(element));
            }
            return obj;
        }

        // Number, Boolean, Enum 등 단순 타입이면 그대로 반환
        if (obj instanceof Number || obj instanceof Boolean || obj instanceof Enum) {
            return obj;
        }

        // 일반 객체면 필드를 순회하며 재귀적으로 처리
        for (Field field : obj.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            try {
                Object value = field.get(obj);
                if (value != null) {
                    field.set(obj, unescapeAllStrings(value));
                }
            } catch (IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        }

        return obj;
    }

    // 기본 relaxed safelist 사용
    public String sanitizeRelaxed(String html) {
        Safelist safelist = Safelist.relaxed()
                .addTags("span")
                .addAttributes("span", "style", "class")
                .addAttributes("a", "target")
                .addAttributes("img", "data-placeholder", "class")
                .addProtocols("img", "src", "data");

        return Jsoup.clean(html, safelist);
    }
    // ============================================================
}
