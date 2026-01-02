/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 02일
 * 개발목적 : Monthly Report Management 화면 구성을 위한 Controller.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 09월 11일
 - 내용 : 타이틀 이름 변경 (Monthly Report Management > Report Management)
 2. 수정자 / 일자 : 김연주 / 2025년 10월 13일
 - 내용 : 허용 권한 수정 (EC 권한 추가) / Report Search 추가
 */

package com.nnp.qsremit.controller.pgManagement.PGReportManagement;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PGReportController {

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping("/pgManagement/monthlyReportManagement")
    public String ReportManagement(Model model) {
        model.addAttribute("title", "Report Management");
        return "pgManagement/PGReportManagement";
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'EC_ADMIN')")
    @GetMapping("/pgManagement/monthlyReportSearchManagement")
    public String ReportSearchManagement(Model model) {
        model.addAttribute("title", "Report Search Management");
        return "pgManagement/PGReportSearchManagement";
    }
}
