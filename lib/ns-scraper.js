// ns-scraper.js

import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';

const __dirname = dirname(fileURLToPath(import.meta.url)); // jshint ignore:line
dotenv.config({path: path.resolve(__dirname, '../.env')});

const useragent = process.env.USERAGENT || 'RealVotes <UA not set>';

async function getData(url) {
  return await axios.get(url, { headers: {'User-Agent': useragent} })
    .then(function (response) {
      let parser = new xml2js.Parser({
        trim: true,
        normalizeTags: true,
        ignoreAttrs: true
      });
      return parser.parseStringPromise(response.data)
        .then(function (result) {
          let res = result.wa.resolution[0];
          let returnData = {
            res: {
              author: res.proposed_by,
              title: res.name
            },
            for: {
              original: parseInt(res.total_votes_for),
              deinflated: parseInt(res.total_nations_for),
              difference: (parseInt(res.total_votes_for) - parseInt(res.total_nations_for))
            },
            against: {
              original: parseInt(res.total_votes_against),
              deinflated: parseInt(res.total_nations_against),
              difference: (parseInt(res.total_votes_against) - parseInt(res.total_nations_against))
            }
          };
          return JSON.stringify(returnData);
        })
      .catch(function (e) {
        return new Error(e);
      });
  })
  .catch(function (e) {
    return new Error(e);
  });
}


export const ga = async () => {
  try {
    return await getData('https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=resolution');
  }
  catch (e) {
    return new Error(e);
  }
};
export const sc = async () => {
  try {
    return await getData('https://www.nationstates.net/cgi-bin/api.cgi?wa=2&q=resolution');
  }
  catch (e) {
    return new Error(e);
  }
};