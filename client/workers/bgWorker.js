import { expose } from 'comlink';
import { initSegmenter, getSegmentationMask } from '../utils/tfjs-model';

const api = {
  async init() {
    await initSegmenter();
  },
  async segment(imageData) {
    return await getSegmentationMask(imageData);
  }
};

expose(api);
