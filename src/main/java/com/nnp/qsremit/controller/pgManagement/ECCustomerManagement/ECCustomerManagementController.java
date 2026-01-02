/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 05월 13일
 * 개발목적 : GME(PG) 관리 화면을 제공 및 처리하기 위한 컨트롤러.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 06월 13일
 - 내용 : register 명칭을 new로 변경하여 반영.
 ....
 */

package com.nnp.qsremit.controller.pgManagement.ECCustomerManagement;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ECCustomerManagementController {

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping("/pgManagement/ECCustomerManagement")
    public String ECCustomerManagement(Model model) {
        model.addAttribute("title", "EC Customer Management");
        return "pgManagement/ECCustomerManagement";
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping("/pgManagement/newECCustomerManagement")
    public String newECCustomerManagement(Model model) {
        model.addAttribute("title", "New EC Customer");
        return "pgManagement/newECCustomerManagement";
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping("/pgManagement/ECCustomerDetail")
    public String ECCustomerDetailPage(@RequestParam("customerId") String customerId, Model model) {
        model.addAttribute("customerId", customerId);
        model.addAttribute("title", "EC Customer Detail");
        return "pgManagement/ECCustomerDetail";
    }
}
