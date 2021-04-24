import axios from 'axios';

export interface Coordinates {
  lat : number;
  long : number;
}

export async function postCodeToLatLong(postcode : string):Promise<Coordinates>{
  const resp = await axios({
    baseURL: `https://api.postcodes.io/postcodes/${postcode}`,
    method: 'get'
  });
  if (resp.status == 200) {
    const ret : Coordinates = {
      lat : resp.data.result.latitude,
      long : resp.data.result.longitude
    };
    return ret;
  } else {
    console.log('Couldnt convert to long lat');
  }
  return null;
}

