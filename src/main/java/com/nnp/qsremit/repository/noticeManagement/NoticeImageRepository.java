/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08일
 * 개발목적 : 이슈에 첨부된 이미지 파일의 저장 및 조회 기능을 제공하는 Repository 인터페이스입니다.
 * 참고 :
 * 수정사항:
 1. 수정자 / 일자 : 한서흔 / 2025년 08월 26일
 - 내용 : image가 등록된 issue id 검색하는 메소드 추가.
 */
package com.nnp.qsremit.repository.noticeManagement;


import com.nnp.qsremit.Entity.notice.NoticeImgEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeImageRepository extends JpaRepository<NoticeImgEntity, Long> {
    List<NoticeImgEntity> findByTempId(Long issueId);

    //파일명이 "noticeManagement"로 시작하는 이미지 리스트 조회
    List<NoticeImgEntity> findByTempIdAndFileNameStartingWith(Long tempId, String prefix);
}
