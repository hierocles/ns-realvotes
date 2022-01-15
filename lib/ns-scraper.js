// ns-scraper.js

import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url)); // jshint ignore:line
dotenv.config({path: path.resolve(__dirname, '../.env')});

const useragent = process.env.USERAGENT || 'RealVotes <UA not set>';

async function scrapeData(url) {
  return await axios.get(url, { headers: {'User-Agent': useragent} })
    .then(function (response) {
      const $ = cheerio.load(response.data);
      const html = $.html();

      if(html.indexOf('No Resolution At Vote') > 0) {
        return false;
      }

      const resTitle = $('div.WA_thing_header a').text();
      const resAuthor = $('div.WA_thing_rbox span.nnameblock:last').text();

      const forHtmlBlock = html.substring(html.indexOf('<p><b>For</b>:'), html.indexOf('<p><b>Against</b>:'));
      const againstHtmlBlock = html.substring(html.indexOf('<p><b>Against</b>:'), html.indexOf('<p style="clear:right"><a href="page=UN_delegate_votes/council=1/fmt=4">Show Delegate Voting History</a>'));

      const forTotal = parseFloat(forHtmlBlock.match(/([1-9]\d{0,2}(,?\d{3})*)/g)[0].replace(/,/g, ''));
      const againstTotal = parseFloat(againstHtmlBlock.match(/([1-9]\d{0,2}(,?\d{3})*)/g)[0].replace(/,/g, ''));

      const nationForVoteCount = parseFloat(forHtmlBlock.match(/([1-9]\d{0,2}(,?\d{3})*)(?!.*([1-9]\d{0,2}(,?\d{3})*))/g)[0].replace(/,/g, ''));
      const nationAgainstVoteCount = parseFloat(againstHtmlBlock.match(/([1-9]\d{0,2}(,?\d{3})*)(?!.*([1-9]\d{0,2}(,?\d{3})*))/g)[0].replace(/,/g, ''));

      const delegateForVoteCount = $($.parseHTML('<div>' + forHtmlBlock + '</div>')).find('a').length;
      const delegateAgainstVoteCount = $($.parseHTML('<div>' + againstHtmlBlock + '</div>')).find('a').length;

      const deinflatedForVotes = nationForVoteCount + delegateForVoteCount;
      const deinflatedAgainstVotes = nationAgainstVoteCount + delegateAgainstVoteCount;

      const inflatedForDifference = forTotal - deinflatedForVotes - delegateForVoteCount;
      const inflatedAgainstDifference = againstTotal - deinflatedAgainstVotes - delegateAgainstVoteCount;

      const forReturnData = {
        original: forTotal,
        nations: nationForVoteCount,
        delegates: delegateForVoteCount,
        deinflated: deinflatedForVotes,
        difference: inflatedForDifference
      };

      const againstReturnData = {
        original: againstTotal,
        nations: nationAgainstVoteCount,
        delegates: delegateAgainstVoteCount,
        deinflated: deinflatedAgainstVotes,
        difference: inflatedAgainstDifference
      };

      const returnData = {
        res: {
          author: resAuthor,
          title: resTitle
        },
        for: forReturnData,
        against: againstReturnData
      };

      return JSON.stringify(returnData);
  })
  .catch(function (e) {
    return new Error(e);
  });
}

export const ga = async () => {
  try {
    return await scrapeData('https://www.nationstates.net/page=UN_delegate_votes/council=1');
  }
  catch (e) {
    return new Error(e);
  }
};
export const sc = async () => {
  try {
    return await scrapeData('https://www.nationstates.net/page=UN_delegate_votes/council=2');
  }
  catch (e) {
    return new Error(e);
  }
};