/**
 * Shared tuning values for the Digital Twin scene. Kept in one place so the
 * sun position used by the directional light matches the Sky's sun disc,
 * and so ground/grid/fog scale consistently as the campus grows.
 */
export const SUN_POSITION: [number, number, number] = [120, 160, 90];
export const CAMPUS_GROUND_SIZE = 480;
export const DEFAULT_CAMERA_POSITION: [number, number, number] = [150, 130, 165];
