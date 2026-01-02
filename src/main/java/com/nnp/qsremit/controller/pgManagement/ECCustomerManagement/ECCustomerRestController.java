///**
// * 개발자 : 한서흔
// * 개발일 : 2025년 05월 29일
// * 개발목적 : EC Customer DB 데이터를 CRUD 기법으로 관리하기 위한 Rest Controller 설계.
// * 참고 :
// * 수정사항 :
// 1. 수정자 / 일자 : 한서흔 / 2025년 06월 04일
// - 내용 : 서치 필드 추가.
// 2. 수정자 / 일자 : 한서흔 / 2025년 06월 09일
// - 내용 : EC Customer 세부 데이터를 수정할 수 있는 createECCustomer 기능 추가.
// 3. 수정자 / 일자 : 한서흔 / 2025년 06월 13일
// - 내용 : CREATE, UPDATE log 어노테이션 기능 추가, register 명칭 new로 변경.
// 4. 수정자 / 일자 : 최유진 / 2025년 06월 26일
// - 내용 : bankcode, reason 정보를 불러오는 메소드 추가.
// 5. 수정자 / 일자 : 한서흔 / 2025년 07월 01일
// - 내용 : 검색 기능 개선.
// 6. 수정자 / 일자 : 한서흔 / 2025년 07월 02일
// - 내용 : Active Status 관련 데이터만 조회하는 GetMapping 기능 추가.
// 7. 수정자 / 일자 : 최유진 / 2025년 07월 07일
// - 내용 : 로그 action 타입을 LogEventType으로 변경, 메소드 이름 수정.
// 8. 수정자 / 일자 : 최유진 / 2025년 08월 01일
// - 내용 : gmeBankCode 관련 코드 제거
// 9. 수정자 / 일자 : 한서흔 / 2025년 08월 13일
// - 내용 : EC Customer의 API 호출 권한 설정 등록.
// */
//package com.nnp.qsremit.controller.pgManagement.ECCustomerManagement;
//
//import com.nnp.nextqsremit_core.Entity.pgManagement.bankDeposit.GmeReasonCodeEntity;
//import com.nnp.nextqsremit_core.Entity.user.logRecord.LogEventType;
//import com.nnp.nextqsremit_core.aspect.annotation.UserLoggable;
//import com.nnp.nextqsremit_core.controller.pgManagement.ECCustomerManagement.dto.ECCustomerForm;
//import com.nnp.nextqsremit_core.controller.pgManagement.bankDepositManagement.dto.response.BankCodeResponseDto;
//import com.nnp.nextqsremit_core.service.pgManagement.ECCustomerManagement.ECCustomerService;
//import jakarta.servlet.http.HttpSession;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
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
//@Controller
//@RequiredArgsConstructor
//@RequestMapping("/pgManagement")
//public class ECCustomerRestController {
//
//    private final ECCustomerService ecCustomerService;
//
//    // 전체 조회를 위한
//    @GetMapping("/ECCustomerManagement/list")
//    public ResponseEntity<?> getList() {
//        try {
//            Map<String, Object> data = ecCustomerService.findAllBy();
//            return ResponseEntity.status(HttpStatus.OK).body(data);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Failed to get customer list.");
//        }
//    }
//
//    @GetMapping("/ECCustomerManagement/search")
//    public ResponseEntity<?> getSearchList(
//            @RequestParam String status,
//            @RequestParam(required = false) String searchType,
//            @RequestParam(required = false, defaultValue = "") String searchValue
//    ) {
//        try {
//            return ResponseEntity.status(HttpStatus.OK).body(ecCustomerService.searchBy(status, searchType, searchValue));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get searched list.");
//        }
//    }
//
//    // 전체 Active 조회를 위한
//    @GetMapping("/ECCustomerManagement/active/list")
//    public ResponseEntity<?> getActiveList() {
//        try {
//            Map<String, Object> data = ecCustomerService.findActiveBy();
//            return ResponseEntity.status(HttpStatus.OK).body(data);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Failed to get customer list.");
//        }
//    }
//
//    @GetMapping("/ECCustomerManagement/active/search")
//    public ResponseEntity<?> getSearchList(
//            @RequestParam(required = false) String searchType,
//            @RequestParam(required = false, defaultValue = "") String searchValue
//    ) {
//        try {
//            return ResponseEntity.status(HttpStatus.OK).body(ecCustomerService.searchActiveBy(searchType, searchValue));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get searched list.");
//        }
//    }
//
//    @GetMapping("/ECCustomerDetail/{customerId}")
//    @ResponseBody
//    public ResponseEntity<?> getECCustomerDetail(@PathVariable("customerId") Long id){
//        try {
//            return ResponseEntity.status(HttpStatus.OK).body(ecCustomerService.getCustomerDetail(id));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get customer list.");
//        }
//    }
//
//    @UserLoggable(actionType = LogEventType.UPDATE)
//    @PutMapping("/ECCustomerDetail/update/{id}")
//    public @ResponseBody ResponseEntity<Map<String, String>> updateEcCustomerManagement(
//            @PathVariable Long id,
//            @RequestBody ECCustomerForm form,
//            Principal principal,
//            HttpSession session
//    ) {
//        Map<String, String> res = new HashMap<>();
//
//        try {
//            ecCustomerService.updateECCustomer(id, form);
//            return ResponseEntity.ok(res);
//        } catch (Exception e) {
//            res.put("message", "Error updating data");
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
//        }
//    }
//
//    @UserLoggable(actionType = LogEventType.CREATE)
//    @PostMapping("/newECCustomerManagement/create")
//    public ResponseEntity<?> createEcCustomerManagement(@RequestBody @Valid ECCustomerForm form,
//                                              Principal principal) {
//        try {
//            ecCustomerService.createECCustomer(form);
//
//            return ResponseEntity.ok(form);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("오류가 발생했습니다.");
//        }
//    }
//
//    @GetMapping("/api/bankcode")
//    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
//    public @ResponseBody List<BankCodeResponseDto> getGmeBankCode(){
//        return ecCustomerService.getGmeBankCodeList();
//    }
//
//    @GetMapping("/api/reason")
//    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
//    public @ResponseBody List<GmeReasonCodeEntity> getGmeReasonType(){
//        return ecCustomerService.getGmeReasonTypeList();
//    }
//}
