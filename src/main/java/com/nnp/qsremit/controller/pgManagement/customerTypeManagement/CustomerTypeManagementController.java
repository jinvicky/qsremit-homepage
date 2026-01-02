/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 06월 25일
 * 개발목적 : Account Deposit의 Customer Type을 관리하기 위한 컨트롤러.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 */

package com.nnp.qsremit.controller.pgManagement.customerTypeManagement;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CustomerTypeManagementController {

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping("/pgManagement/customerTypeManagement")
    public String CustomerTypeManagement(Model model) {
        model.addAttribute("title", "Customer Type Management");
        return "pgManagement/customerTypeManagement";
    }
}
