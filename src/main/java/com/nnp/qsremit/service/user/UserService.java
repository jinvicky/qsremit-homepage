/**
 * 개발자 : 김연주
 * 개발일 :
 * 개발목적 :
 * 참고 :
 * 수정사항 :
 *    1. 수정자 / 일자 : 김연주 / 2025년 03월 24일
 *         - 내용 : LocalDateTime에서 OffsetDateTime으로 변경
 *          기존 LocalDateTime은 시간대(time zone) 정보를 포함하지 않아 DB 시간과 로컬 시간이
 *          달라지는 문제가 발생했음. OffsetDateTime을 사용하여 시간대 정보를 저장함으로써,
 *          DB와 로컬 시간 차이를 해결하고 일관된 시간 데이터를 관리할 수 있도록 개선함.
 */
package com.nnp.qsremit.service.user;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class UserService {
    public String getCurrentIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getRemoteAddr(); // 헤더에 값이 없거나 "unknown"인 경우 원시 IP 주소 반환
            }
            return ipAddress; // IP 주소 반환
        }

        return null; // IP 주소를 확인할 수 없는 경우 null 반환
    }
}
