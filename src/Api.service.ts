import axios from 'axios';

export class ApiService {
  private static key = '';
  async mediaSoftApi(modelName = '', createDate = '') {
    const config = {
      headers: {
        Access_token: ApiService.key,
        Accept: 'application/json',
      },
    };
    const response = await axios.post(
      'http://203.76.110.162:8081/Product/GetProductData',
      {
        categoryName: '',
        productName: '',
        modelName: modelName,
        brandName: '',
        createDate: createDate,
      },
      config,
    );
    return response.data;
  }

  async mediaSoftStockApi(modelName) {
    const config = {
      headers: {
        Access_token: ApiService.key,
        Accept: 'application/json',
      },
    };
    const response = await axios.post(
      'http://203.76.110.162:8081/Product/GetProductStockInfo',
      {
        barcode: 'ALL',
        modelName: modelName,
        shopID: 'ALL',
      },
      config,
    );
    return response.data;
  }
}
