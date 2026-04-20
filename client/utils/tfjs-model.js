import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

let segmenter = null;

export async function initSegmenter() {
  if (segmenter) return;
  await tf.ready();
  const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
  const segmenterConfig = {
    runtime: 'tfjs',
    modelType: 'general',
  };
  segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
}

export async function getSegmentationMask(imageData) {
  if (!segmenter) return null;
  const people = await segmenter.segmentPeople(imageData);
  if (people.length > 0) {
    return await people[0].mask.toImageData();
  }
  return null;
}
