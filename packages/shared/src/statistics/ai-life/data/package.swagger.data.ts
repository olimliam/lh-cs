export class PackageSwaggerData {
  public static packageStatisticsResponse = {
    pageCount: 1200, // 예시 총 방문수
    productStatisticsList: [
      {
        name: '패키지 A',
        count: 500, // 예시 클릭 횟수
        videoStatisticsList: [
          {
            name: '영상 A1',
            count: 200, // 예시 클릭 횟수
          },
          {
            name: '영상 A2',
            count: 300, // 예시 클릭 횟수
          },
        ],
      },
      {
        name: '패키지 B',
        count: 700, // 예시 클릭 횟수
        videoStatisticsList: [
          {
            name: '영상 B1',
            count: 350, // 예시 클릭 횟수
          },
          {
            name: '영상 B2',
            count: 350, // 예시 클릭 횟수
          },
        ],
      },
    ],
  };

  static packageListResponse = {
    packageList: [
      {
        id: 1,
        name: '패키지 A',
        imageUrl: 'https://example.com/package-a.jpg',
        count: 150,
      },
      {
        id: 2,
        name: '패키지 B',
        imageUrl: 'https://example.com/package-b.jpg',
        count: 200,
      },
    ],
  };

  static packageVideoListResponse = {};
}
