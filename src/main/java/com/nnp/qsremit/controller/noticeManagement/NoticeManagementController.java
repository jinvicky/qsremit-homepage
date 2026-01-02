/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08일
 * 개발목적 : 이슈 관리 페이지 및 상세 페이지 라우팅 컨트롤러 구현
 * 참고 : 사용자 유형(UserType)을 기준으로 SUPER_ADMIN 목록 조회
 * 수정사항 :
 1.  수정자 / 일자 : 김연주 / 2025년 07월 13일
 - 내용 : 사용자 유형(UserType)을 기준으로 SUPER_ADMIN 목록 조회 추가
 2. 수정자 / 일자 : 한서흔 / 2025년 08월 13일
 - 내용 : Issue Management의 권한 설정 등록.
 3. 수정자 / 일자 : 한서흔 / 2025년 09월 04일
 - 내용 : newIssuePage 추가.
 4. 수정자 / 일자 : 김연주 / 2025년 10월 14일
 - 내용 : REMIT_ADMIN 접근 권한 추가
 */
package com.nnp.qsremit.controller.noticeManagement;

import com.nnp.qsremit.Entity.notice.NoticeManagementEntity;
import com.nnp.qsremit.Entity.user.UserType;
import com.nnp.qsremit.controller.noticeManagement.dto.response.NoticeListResponseDto;
import com.nnp.qsremit.repository.user.UserRepository;
import com.nnp.qsremit.service.noticeManagement.NoticeManagementService;
import com.nnp.qsremit.service.verification.NoticeManagementVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'REMIT_ADMIN', 'SUPER_AGENT')")
@RequestMapping("/noticeManagement")
public class NoticeManagementController {

    private final UserRepository userRepository;

    private final NoticeManagementService noticeManagementService;

    private final NoticeManagementVerificationService noticeManagementVerificationService;

    @GetMapping("/noticeManagement")
    public String NoticeManagement(Model model) {
        model.addAttribute("title", "Notice Management");
        return "noticeManagement/noticeManagement";
    }

    @GetMapping("/new")
    public String newNoticePage(Model model) {
        model.addAttribute("title", "New Notice");
        return "noticeManagement/noticeManagementNew";
    }

    @GetMapping("/detail")
    public String showNoticeDetailPage(@RequestParam("noticeId") String noticeId, Model model) {
        model.addAttribute("noticeId", noticeId);
        model.addAttribute("users", userRepository.findNamesByUserType(UserType.SUPER_ADMIN));
        model.addAttribute("title", "Notice Detail");
        return "noticeManagement/noticeManagementDetail";
    }

    @GetMapping("/noticeViewList")
    public String noticePage(Model model) {
        List<NoticeListResponseDto> noticeList = noticeManagementService.getNoticeList();
        model.addAttribute("title", "Notice");
        model.addAttribute("noticeList", noticeList);
        return "noticeManagement/noticeList";
    }

    @GetMapping("/noticeView")
    public String showNoticeViewDetailPage(@RequestParam("noticeId") String noticeId, Model model) {
        model.addAttribute("noticeId", noticeId);
        model.addAttribute("title", "Notice Detail");
        return "noticeManagement/noticeDetail";
    }
}
