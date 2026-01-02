/**
 * 개발자 : 김연주
 * 개발일 : 2025년 10월 16일
 * 개발목적 :
 - 사용자가 자신의 계정 정보를 조회하고 비밀번호를 직접 변경할 수 있도록 하는 컨트롤러
 - 사용자 보안 점검 기준에 따라 비밀번호를 변경
 * 주요 기능 :
 1. 프로필 정보 조회 (GET /profileSettings)
 2. 비밀번호 변경 (PUT /profileSettings/changePassword)
 * 수정사항 :
 */
package com.nnp.qsremit.controller.user;

import com.nnp.qsremit.Entity.user.logRecord.LogEventType;
import com.nnp.qsremit.aspect.annotation.UserLoggable;
import com.nnp.qsremit.controller.user.dto.UserProfileRequestDto;
import com.nnp.qsremit.controller.user.dto.UserProfileResponseDto;
import com.nnp.qsremit.service.user.UserProfileService;
import com.nnp.qsremit.service.util.HttpUtils;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;

@Slf4j
@Controller
@AllArgsConstructor
public class UserProfileSettingsController {

    private final HttpUtils httpUtils;
    private final UserProfileService userProfileService;

    @GetMapping("/profileSettings")
    public String profileSettings(Model model, Principal principal) {

        model.addAttribute("title", "Profile Settings");
        UserProfileResponseDto form = (UserProfileResponseDto) httpUtils.unescapeAllStrings(userProfileService.getProfile(principal.getName()));
        model.addAttribute("form", form);

        return "user/userProfileSettings";
    }

    @UserLoggable(actionType = LogEventType.UPDATE)
    @PutMapping("/profileSettings/changePassword")
    public @ResponseBody ResponseEntity<String> changePassword(
            @Valid @RequestBody UserProfileRequestDto form,
            Principal principal,
            HttpSession session
    ) {
        try {
            userProfileService.changePassword(form, principal.getName());
            return ResponseEntity.ok("Password has been changed successfully.");
        }
        catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch (Exception e) {
            log.error("Unexpected error during password change", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
}
