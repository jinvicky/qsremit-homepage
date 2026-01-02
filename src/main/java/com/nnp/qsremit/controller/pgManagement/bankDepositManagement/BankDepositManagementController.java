/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 05월 13일
 * 개발목적 : GME(PG) 관리 화면을 제공 및 처리하기 위한 컨트롤러.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 2. 수정자 / 일자 :
 - 내용 :
 ....
 */

package com.nnp.qsremit.controller.pgManagement.bankDepositManagement;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class BankDepositManagementController {

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping("/pgManagement/bankDepositManagement")
    public String bankDepositManagement(Model model) {
        model.addAttribute("title", "Bank Deposit Management");
        return "pgManagement/bankDepositManagement";
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping("/pgManagement/newBankDepositManagement")
    public String newBankDepositManagement(Model model) {
        model.addAttribute("title", "New Bank Deposit");
        return "pgManagement/newBankDepositManagement";
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping("/pgManagement/bankDepositDetail")
    public String bankDepositDetailPage(@RequestParam("depositId") String depositId, Model model) {
        model.addAttribute("depositId", depositId);
        model.addAttribute("title", "Bank Deposit Detail");
        return "pgManagement/bankDepositDetail";
    }
}
