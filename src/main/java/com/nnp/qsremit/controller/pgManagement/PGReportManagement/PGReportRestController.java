///**
// * 개발자 : 한서흔
// * 개발일 : 2025년 09월 11일
// * 개발목적 : PG Report Management REST Api 사용을 위한 Controller 설계.
// * 참고 :
// * 수정사항 :
// 1. 수정자 / 일자 : 한서흔 / 2025년 09월 23일
// - 내용 : PDF 첨부 이메일 발송 메소드 개발.
// 2. 수정자 / 일자 : 한서흔 / 2025년 09월 24일
// - 내용 : 메일 발송 실패 시 Response 추가.
// 3. 수정자 / 일자 : 김연주 / 2025년 10월 13일
// - 내용 : sendPdfEmail 메서드 분리 및 Report Search 조회 메서드 축가
// 4. 수정자 / 일자 : 김연주 / 2025년 10월 31일
// - 내용 : 이메일, 문자, 푸시 관련 로직 제거
// */
//
//package com.nnp.qsremit.controller.pgManagement.PGReportManagement;
//
//import com.nnp.nextqsremit_core.controller.pgManagement.PGReportManagement.dto.PGReportListDto;
//import com.nnp.nextqsremit_core.controller.pgManagement.PGReportManagement.dto.PGReportResponseDto;
//import com.nnp.nextqsremit_core.controller.pgManagement.PGReportManagement.dto.PGReportSearchListProjection;
//import com.nnp.nextqsremit_core.service.pgManagement.PGReport.PGReportService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.security.Principal;
//import java.util.List;
//
//@Slf4j
//@Controller
//@RequiredArgsConstructor
//@RequestMapping("/api/pgManagement/pgReport")
//public class PGReportRestController {
//
//    private final PGReportService PGReportService;
//
//    /**
//     * Customer 전체 목록 데이터 가져오는 메소드
//     * @param month
//     * @return
//     */
//    @GetMapping("/")
//    public @ResponseBody List<PGReportListDto> getPGReportList(
//            @RequestParam String month
//    ) {
//        return PGReportService.findList(month);
//    }
//
//    /**
//     * Customer 별로 한달간 세부 내역 데이터 가져오는 메소드
//     * @param customerTypeId
//     * @param month
//     * @return
//     */
//    @GetMapping("/detail")
//    public @ResponseBody PGReportResponseDto getCustomerPGReport(
//            @RequestParam Long customerTypeId,
//            @RequestParam String month
//    ) {
//        return PGReportService.getCustomerReport(customerTypeId, month);
//    }
//
//    /**
//     * PDF 첨부 이메일 발송
//     */
//    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
//    @PostMapping("/email")
//    public ResponseEntity<String> sendPdfEmail(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("to") List<String> to,
//            @RequestParam("subject") String subject,
//            @RequestParam("payload") String payload,
//            @RequestParam("accountTypeId") Long accountTypeId,
//            @RequestParam("reportMonth") String reportMonth,
//            Principal principal) {
//        String userId = principal.getName();
//
//        try {
//            boolean result = PGReportService.sendMonthlyReportEmail(
//                    userId,
//                    file,
//                    to,
//                    subject,
//                    payload,
//                    accountTypeId,
//                    reportMonth
//            );
//
//            if (result) {
//                return ResponseEntity.ok("Success to send email.");
//            } else {
//                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                        .body("Failed to send PDF email.");
//            }
//        } catch (IOException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Failed to send PDF email. " + e.getMessage());
//        }
//    }
//
//
//    @GetMapping("/search/{reportMonth}")
//    public ResponseEntity<List<PGReportSearchListProjection>> getMonthlyReport(
//            @PathVariable String reportMonth) {
//        return ResponseEntity.ok(PGReportService.getMonthlyReportByMonth(reportMonth));
//    }
//}
