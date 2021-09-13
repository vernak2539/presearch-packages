"use strict";

// @ts-ignore
const fetch = require("node-fetch");

const truncate = (fullStr, strLen, separator = "...") => {
  if (fullStr.length <= strLen) return fullStr;

  const sepLen = separator.length;
  const charsToShow = strLen - sepLen;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return `${fullStr.substr(0, frontChars)}${separator}${fullStr.substr(
    fullStr.length - backChars
  )}`;
};

const loadAssets = async (query) => {
  const [response1, response2] = await Promise.all([
    fetch(
      `https://api.opensea.io/api/v1/assets?format=json&asset_contract_address=${query}&order_direction=desc&offset=0&limit=5`
    ),
    fetch(
      `https://api.opensea.io/api/v1/assets?format=json&owner=${query}&order_direction=desc&offset=0&limit=5`
    ),
  ]);

  const [data1, data2] = await Promise.all([
    response1.json(),
    response2.json(),
  ]);

  if (data1.assets.length) {
    return data1.assets;
  }
  return data2.assets;
};

async function openSea(query) {
  const assets = await loadAssets(query);

  const firstAsset =
    assets &&
    assets.find((asset) => {
      return (
        asset &&
        ((asset.owner && asset.owner.address === query) ||
          (asset.asset_contract && asset.asset_contract.address === query))
      );
    });

  return `
  <div style="min-width: 90vw;" class="w-full flex flex-column flex-md-row flex-md-nowrap items-start bg-cultured">
    <div style="max-width: 900px; min-height: 450px; padding: 2rem 1rem;" class="flex bg-light-white justify-between items-start me-3">
      <div style="width: 40%; padding: 0 0; overflow: hidden;" class="border rounded flex justify-center items-start bg-white">
        <img width="400px" height="380px" src="${
          firstAsset
            ? firstAsset.image_url ||
              firstAsset.image_thumbnail_url ||
              firstAsset.image_preview_url
            : ""
        }" alt="${firstAsset ? firstAsset.name || "N/A" : ""}" />
      </div>
      <div class="flex flex-col items-start ps-3 py-3 pr-0" style="width: 55%; flex: 1;">
        <strong class="fw-bold fs-5">${
          firstAsset ? firstAsset.name || "NA" : ""
        }</strong>
        <a style="margin-bottom: 1rem;" href="${
          firstAsset ? firstAsset.external_link || firstAsset.permalink : ""
        }" class="text-grey-web">View on openSea</a>
        <span class="text-grey-web--dark">${
          firstAsset
            ? firstAsset.description ||
              firstAsset.name ||
              (firstAsset.collection && firstAsset.collection.description)
            : ""
        }</span>
        <span class="flex items-center text-grey-web" style="margin-top: 1rem;">
          <span style="height: 25px; width: 25px; overflow: hidden; border-radius: 50%; margin-right: 0.5rem;" class="flex justify-center items-center">
            <img src="${
              firstAsset && firstAsset.owner
                ? firstAsset.owner.profile_img_url
                : ""
            }" width="40px" />
          </span>
          Owned by &nbsp; <a class="text-bluetiful" href="${
            firstAsset ? firstAsset.profile_img_url | "#" : ""
          }">${
    firstAsset && firstAsset.owner && firstAsset.owner.user
      ? firstAsset.owner
        ? truncate(firstAsset.owner.address, 12)
        : ""
      : "N/A"
  }</a>
        </span>
        <div style="margin-top: 0.6rem;" class="h-full w-full">
          <div style="padding: 1rem 0; flex: 1;" class="flex flex-col justify-start items-start">
            <a href="${
              firstAsset ? firstAsset.permalink || firstAsset.external_link : ""
            }">
              <button class="btn--primary cursor-pointer flex items-center rounded" style="border: 0; padding: 0.8rem 2.5rem; margin-bottom: 1rem;">
                VIEW THIS ITEM
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#fff"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div style="max-width: 500px;" class="mx-2 rounded flex flex-column container-fluid bg-cultured">
      <div class="row w-100">
        ${
          assets
            ? assets
                .filter((asset) => firstAsset.id !== asset.id)
                .filter((_asset, i) => i < 4)
                .map(
                  (asset) => `
                <div class="p-2 col-md-6">
                  <div class="border rounded bg-white p-2 d-flex flex-col">
                    <img src="${
                      asset.image_thumbnail_url ||
                      asset.image_preview_url ||
                      asset.image_url
                    }" width="100%" height="170px" class="border" />
                    <small class="text-grey-web mt-2">${
                      asset.collection.name
                    }</small>
                    <a href="${
                      asset.external_link || asset.permalink
                    }" class="mb-3 mt-1 fw-bolder cursor-pointer">${
                    asset.name || asset.collection.name || "NA"
                  }</a>
                  </div>
                </div>
                `
                )
                .join("")
            : ""
        }
      </div>
    </div>
  </div>`;
}

async function trigger(query) {
  return query.indexOf("0x") >= 0;
}

module.exports = { openSea, trigger };