///**
// * 개발자 : 한서흔
// * 개발일 : 2025년 09월 02일
// * 개발목적 : Daily Summary Management 화면 구성을 위한 Rest Controller.
// * 참고 :
// * 수정사항 :
// 1. 수정자 / 일자 : 한서흔 / 2025년 09월 04일
// - 내용 : Daily Summary Management 설계를 위한 REST 메소드 추가.
// 2. 수정자 / 일자 : 한서흔 / 2025년 09월 05일
// - 내용 : getDailySummaries 파라미터 수정.
// 3. 수정자 / 일자 : 한서흔 / 2025년 09월 11일
// - 내용 : 환불 테이블 관련 메소드 추가.
// 4. 수정자 / 일자 : 한서흔 / 2025년 09월 19일
// - 내용 : UserLoggable 추가 -> 삭제
// 5. 수정자 / 일자 : 한서흔 / 2025년 09월 23일
// - 내용 : 날짜 기간으로 검색하는 메소드 추가.
// 6. 수정자 / 일자 : 한서흔 / 2025년 09월 24일
// - 내용 : Customer Type 검색 추가.
// */
//
//package com.nnp.qsremit.controller.pgManagement.dailySummaryManagement;
//
//import com.nnp.nextqsremit_core.controller.pgManagement.dailySummaryManagement.dto.*;
//import com.nnp.nextqsremit_core.service.pgManagement.DailySummary.DailySummaryService;
//import com.nnp.nextqsremit_core.service.pgManagement.DailySummary.RefundSummaryService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.*;
//
//import java.security.Principal;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Slf4j
//@Controller
//@RequiredArgsConstructor
//@RequestMapping("/api/pgManagement/dailySummary")
//public class DailySummaryRestController {
//
//    private final DailySummaryService dailySummaryService;
//    private final RefundSummaryService refundSummaryService;
//
//    @GetMapping("/")
//    public @ResponseBody List<DailySummaryResponseDto> getDailySummaries(
//            @RequestParam String date,
//            @RequestParam(required = false) List<Long> types
//    ){
//        return dailySummaryService.findAll(date, types);
//    }
//
//    @GetMapping("/range")
//    public @ResponseBody List<DailySummaryResponseDto> getDailyRangeSummaries(
//            @RequestParam String startDate,
//            @RequestParam String endDate,
//            @RequestParam(required = false) List<Long> types
//    ){
//        return dailySummaryService.findAllRange(startDate, endDate, types);
//    }
//
//    @PutMapping("/update")
//    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
//    public @ResponseBody ResponseEntity<?> updateDailySummaries(@RequestBody List<DailySummaryUpdateDto> summaries) {
//        Map<String, String> response = new HashMap<>();
//
//        try {
//            dailySummaryService.updateAll(summaries);
//            response.put("message", "Data updated successfully");
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
//
//    @GetMapping("/type")
//    public @ResponseBody List<DailySummaryTypeResponseDto> getDailySummaryTypeDetails(
//            @RequestParam String date,
//            @RequestParam Long typeId
//    ) {
//        return dailySummaryService.findAllType(date, typeId);
//    }
//
//    /**
//     * Refund Table
//     */
//    @GetMapping("/refund/type")
//    public @ResponseBody List<RefundSummaryTypeResponseDto> getRefundSummaryTypeDetails(
//            @RequestParam String date,
//            @RequestParam Long typeId
//    ) {
//        return refundSummaryService.findAllRefundType(date, typeId);
//    }
//
//    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
//    @PostMapping("/refund/create")
//    public @ResponseBody ResponseEntity<?> createTypeRefund(@RequestBody RefundSummaryTypeSaveDto dto, Principal principal){
//        Map<String, String> response = new HashMap<>();
//
//        try {
//            refundSummaryService.create(dto);
//            response.put("message", "Data created successfully");
//            return ResponseEntity.ok(response);
//        } catch (Exception e){
//            response.put("message", "Error updating data");
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//        }
//    }
//
//    @PutMapping("/refund/update")
//    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
//    public @ResponseBody ResponseEntity<?> updateRefundSummary(@RequestBody RefundSummaryTypeUpdateDto dto, Principal principal) {
//        Map<String, String> response = new HashMap<>();
//
//        try {
//            refundSummaryService.update(dto);
//            response.put("message", "Data updated successfully");
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
//
//    @DeleteMapping("/refund/delete/{id}")
//    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
//    public @ResponseBody ResponseEntity<?> deleteRefundSummary(@PathVariable Long id, Principal principal) {
//        Map<String, String> response = new HashMap<>();
//
//        try {
//            refundSummaryService.delete(id);
//            response.put("message", "Data deleted successfully");
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
//}
