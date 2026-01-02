/**
* 개발자 : 김연주
* 개발일 : 2025년 04월 17일
* 개발목적 : 로그인 실패 처리 로직 구현
* 참고 : Spring Security의 AuthenticationFailureHandler 구현
* 수정사항 :
1. 수정자 / 일자 :
- 내용 :
*/
package com.nnp.qsremit.security;


import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.repository.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {
    private final CacheManager cacheManager;
    private final UserRepository userRepository;

    private static final String CACHE_NAME = "loginFailCache";
    private static final int MAX_ATTEMPTS = 5;

    public boolean onLoginFailure(String username) {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        Integer attempts = cache.get(username, Integer.class);
        if (attempts == null) {
            attempts = 0;
        }

        attempts += 1;

        if (attempts >= MAX_ATTEMPTS) {
            Optional<UserEntity> user = userRepository.findByUserId(username);
            user.ifPresent(u -> {
                u.setAccountLocked(true);
                userRepository.save(u);
            });
            cache.evict(username); // 더 이상 카운트 필요 없음
            return true;
        } else {
            cache.put(username, attempts);
            return false;
        }
    }

    @Transactional
    public void onLoginSuccess(String username) {
        // 로그인 성공 시 캐시 제거
        cacheManager.getCache(CACHE_NAME).evict(username);
    }

    public boolean isAccountLocked(String username) {
        Optional<UserEntity> user = userRepository.findByUserId(username);
        return user.map(UserEntity::isAccountLocked).orElse(false);
    }
}
