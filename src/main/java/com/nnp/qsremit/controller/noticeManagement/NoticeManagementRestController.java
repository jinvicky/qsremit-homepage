/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08일
 * 개발목적 : 인증된 사용자를 기반으로 검증된 Issue 이력 엔터티 데이터를 조회한 후,
 - 이를 클라이언트에 응답 가능한 DTO 리스트로 변환하여 제공하는 서비스로서,
 - 데이터 조회의 안정성과 효율성을 확보하기 위해 개발.
 * 참고 :
 * 수정사항:
 1. 수정자 / 일자 : 채호정 / 2025년 04월 08일
 - 내용 : getIssueManagement() 메서드 추가.
 2. 수정자 / 일자 : 채호정 / 2025년 04월 09일
 - 내용 : 이슈 관리 controller 로직 구현.
 3. 수정자 / 일자 : 최유진 / 2025년 04월 28일
 - 내용 : 생성, 수정 이벤트에 대해 로그 기록 추가.
 4. 수정자 / 일자 : 김연주 / 2025년 07월 04일
 - 내용 : getAllIssues에 검색 파라미터 RequestParam 추가
 5. 수정자 / 일자 : 최유진 / 2025년 07월 07일
 - 내용 : 로그 action 타입을 LogEventType으로 변경, 메소드 이름 수정.
 6. 수정자 / 일자 : 최유진 / 2025년 08월 13일
 - 내용 : 폴더 위치 이동
 7. 수정자 / 일자 : 한서흔 / 2025년 08월 26일
 - 내용 : 이미지 반환하도록 updateIssueManagement 수정.
 8. 수정자 / 일자 : 김연주 / 2025년 10월 14일
 - 내용 : REMIT_ADMIN 접근 권한 추가
 */
package com.nnp.qsremit.controller.noticeManagement;

import com.nnp.qsremit.Entity.user.logRecord.LogEventType;
import com.nnp.qsremit.aspect.annotation.UserLoggable;
import com.nnp.qsremit.controller.noticeManagement.dto.NoticeImageDto;
import com.nnp.qsremit.controller.noticeManagement.dto.request.createNoticeRequestDto;
import com.nnp.qsremit.controller.noticeManagement.dto.request.updateNoticeRequestDto;
import com.nnp.qsremit.controller.noticeManagement.dto.response.NoticeListResponseDto;
import com.nnp.qsremit.service.noticeManagement.NoticeManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/noticeManagement")
public class NoticeManagementRestController {

    private final NoticeManagementService noticeManagementService;

    /**
     * 공지 list 조회
     */
    @GetMapping
    public ResponseEntity<List<NoticeListResponseDto>> getAllNotices(@RequestParam(required = false) String startDate, @RequestParam(required = false) String endDate) {
        List<NoticeListResponseDto> allIssues = noticeManagementService.getNoticeList(startDate, endDate);
        return ResponseEntity.ok(allIssues);
    }

    @GetMapping("/noticeDetail/{id}")
    public ResponseEntity<NoticeListResponseDto> getNoticeManagement(@PathVariable("id") Long id){
        NoticeListResponseDto response = noticeManagementService.getNoticeDetail(id);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/noticeList")
    public ResponseEntity<List<NoticeListResponseDto>> getNoticeList() {
        List<NoticeListResponseDto> list = noticeManagementService.getNoticeList();
        return ResponseEntity.ok(list);
    }



    /**
     * 새로운 공지 생성
     * 이슈 생성 후 개발자 계정으로 이메일 발송
     */
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'REMIT_ADMIN','SUPER_AGENT')")
    @UserLoggable(actionType = LogEventType.CREATE)
    @PostMapping("/newNotice")
    public ResponseEntity<String> createNoticeManagement(@Valid @RequestPart("dto") createNoticeRequestDto dto,
                                                        @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
                                                        @RequestPart(value = "images", required = false) List<MultipartFile> images,
                                                        Principal principal){

      noticeManagementService.createNoticeManagement(dto, thumbnail, images, principal.getName());
      return ResponseEntity.ok().body("Notice created");
    }

    /**
     * 기존 공지 수정
     */
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'REMIT_ADMIN', 'SUPER_AGENT')")
    @UserLoggable(actionType = LogEventType.UPDATE)
    @PutMapping("/update/{noticeId}")
    public ResponseEntity<String> updateNoticeManagement(@PathVariable("noticeId") Long noticeId,
                                                    @Valid @RequestPart("dto") updateNoticeRequestDto dto,
                                                    @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
                                                    @RequestPart(value = "images", required = false) List<MultipartFile> images,
                                                    Principal principal){
        noticeManagementService.updateNotice(noticeId, dto, thumbnail, images);
        return ResponseEntity.ok().body("Notice updated");
    }

    /**
     * 공지사항 삭제
     */
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'REMIT_ADMIN', 'SUPER_AGENT')")
    @UserLoggable(actionType = LogEventType.DELETE)
    @DeleteMapping("/delete/{noticeId}")
    public ResponseEntity<String> deleteNoticeManagement(@PathVariable("noticeId") Long noticeId){
        noticeManagementService.deleteNotice(noticeId);
        return ResponseEntity.ok().body("Notice deleted");
    }
}
