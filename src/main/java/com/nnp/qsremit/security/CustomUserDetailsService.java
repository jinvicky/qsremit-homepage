/**
 * 개발자 : 김연주
 * 개발일 : 2025년 05월 16일
 * 개발목적 :
 * - `Spring Security`의 `UserDetailsService`를 구현하여 사용자 인증 시 고객 정보를 로드.
 * - 데이터베이스에서 고객 정보를 조회 후, `CustomerSecurityResponseDto` 객체로 반환.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 08월 11일
 - 내용 : username null 처리
 2. 수정자 / 일자 : 김연주 / 2025년 08월 12일
 - 내용 : 고객 조회시 disable 계정 제외
 */
package com.nnp.qsremit.security;


import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.dto.user.UserSecurityDto;
import com.nnp.qsremit.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        UserEntity userEntity = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

        log.info("USER ID : {}", userEntity.getUserId());

        return new UserSecurityDto(
                userEntity.getId(),
                userEntity.getUserId(),
                userEntity.getPassword(),
                userEntity.getUserType(),
                userEntity.getName(),
                userEntity.getEmail(),
                userEntity.getMobile(),
                userEntity.isTransactionReport(),
                false,
                userEntity.isResetPassword()
        );
    }
}
