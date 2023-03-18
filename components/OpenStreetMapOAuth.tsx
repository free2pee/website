// OpenStreetMapOAuth.tsx
import { useState } from 'react';
import OAuth from 'react-oauth';
import axios from 'axios';
// import OAuth from 'oauth';
import crypto from 'crypto';
import querystring from 'query-string';

const OSM_API_BASEURL = 'https://www.openstreetmap.org';
const OSM_API_PATH = '/oauth';

const getOAuthConfig = () => {
  return {
    consumer: {
      key: process.env.client_id,
      secret: process.env.client_secret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string: any, key: any ) {
      return crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64');
    },
  };
};

export const OpenStreetMapOAuth = () => {
  const [requestToken, setRequestToken] = useState({});
  const [accessToken, setAccessToken] = useState({});

  // Step 1: Obtain a request token
  const getRequestToken = async () => {
    const oauth = OAuth(getOAuthConfig());
    const requestData = {
      url: `${OSM_API_BASEURL}${OSM_API_PATH}/request_token`,
      method: 'POST',
      data: {
        oauth_callback: window.location.origin + window.location.pathname,
      },
    };

    const headers = oauth.toHeader(oauth.authorize(requestData));
    try {
      const response = await axios.post(requestData.url, null, { headers });
      setRequestToken(querystring.parse(response.data));
      return querystring.parse(response.data);
    } catch (error) {
      console.error('Error getting the request token: ', error);
      return null;
    }
  };

  // Step 2: Redirect to provider for authorization
  const redirectToProvider = async () => {
    const token = await getRequestToken();
    if (token && token.oauth_token) {
      window.location.href = `${OSM_API_BASEURL}${OSM_API_PATH}/authorize?oauth_token=${token.oauth_token}`;
    }
  };

  // Step 3: Get Access Token
  const getAccessToken = async (oauthToken, oauthVerifier) => {
    const oauth = OAuth(getOAuthConfig());
    const requestData = {
      url: `${OSM_API_BASEURL}${OSM_API_PATH}/access_token`,
      method: 'POST',
    };

    const headers = oauth.toHeader(
      oauth.authorize(requestData, {
        key: oauthToken,
        secret: requestToken.oauth_token_secret,
      })
    );
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    try {
      const response = await axios.post(
        requestData.url,
        querystring.stringify({ oauth_verifier: oauthVerifier }),
        { headers }
      );
      setAccessToken(querystring.parse(response.data));
    } catch (error) {
      console.error('Error getting the access token: ', error);
    }
  };

  // Step 4: Check for Access Token in URL after redirect
  const checkForAccessToken = () => {
    const oauthCallbackParams = querystring.parse(window.location.search);

    if (oauthCallbackParams?.oauth_token && oauthCallbackParams?.oauth_verifier) {
      getAccessToken(oauthCallbackParams.oauth_token, oauthCallbackParams.oauth_verifier);
    }
  };

  // Call checkForAccessToken on component mount
  useState(() => {
    checkForAccessToken();
  }, []);

  return (
    <div>
      {!accessToken.oauth_token ? (
        <button onClick={redirectToProvider}>Login with OpenStreetMap</button>
      ) : (
        <h1>Authenticated successfully! Your access token is: {accessToken.oauth_token}</h1>
      )}
    </div>
  );
};
