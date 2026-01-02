package com.nnp.qsremit.controller.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ExchangeRateController {

    private final RestTemplate restTemplate;

    public ExchangeRateController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/exchange-rate")
    public ResponseEntity<Map<String, Object>> getExchangeRate(
            @RequestParam String from,
            @RequestParam String to) {

        Map<String, Object> response = new HashMap<>();

        try {
            // ExchangeRate-API 무료 API 사용
            String apiUrl = String.format("https://api.exchangerate-api.com/v4/latest/%s", from);

            Map<String, Object> apiResponse = restTemplate.getForObject(apiUrl, Map.class);

            if (apiResponse != null && apiResponse.containsKey("rates")) {
                Map<String, Double> rates = (Map<String, Double>) apiResponse.get("rates");

                if (rates.containsKey(to)) {
                    Double rate = rates.get(to);
                    response.put("success", true);
                    response.put("rate", rate);
                    response.put("from", from);
                    response.put("to", to);
                    return ResponseEntity.ok(response);
                }
            }

            response.put("success", false);
            response.put("error", "환율 정보를 찾을 수 없습니다.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "환율 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

