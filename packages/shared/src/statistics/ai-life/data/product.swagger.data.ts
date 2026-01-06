export class ProductSwaggerData {
  public static readonly productListResponse = {
    productList: [
      {
        id: 1,
        name: 'Product 1',
        imageUrl: 'https://example.com/image1.jpg',
        count: 10,
      },
    ],
    cardList: [
      {
        productId: 1,
        title: 'Card 1',
        imageUrl: 'https://example.com/card1.jpg',
        count: 3,
        description: 'Description for Card 1',
      },
    ],
  };

  public static readonly productMediaListResponse = {
    videos: [
      {
        id: 1,
        title: 'Media Title 1',
        url: 'https://example.com/media1.jpg',
        count: 100,
        displayOrder: 1,
      },
    ],
  };

  public static readonly productStatistics = {
    pageCount: 500, // 예시: 페이지 방문 수
    productStatisticsList: [
      {
        name: 'Product A',
        count: 120, // 예시: 총 카운트
        videoStatisticsList: [
          {
            name: 'Video 1',
            count: 30,
          },
          {
            name: 'Video 2',
            count: 45,
          },
        ],
      },
      {
        name: 'Product B',
        count: 85,
        videoStatisticsList: [
          {
            name: 'Video 3',
            count: 40,
          },
          {
            name: 'Video 4',
            count: 25,
          },
        ],
      },
    ],
  };
}
