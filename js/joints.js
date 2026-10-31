// Short joint keys -> Unitree R1 MuJoCo joint names.
// ROBOT_KEYS = the 13 r1ctl arm CSV columns (upper body, the only part our code drives on the real robot).
export const ROBOT_KEYS = ["lsp", "lsr", "lsy", "le", "lwr", "rsp", "rsr", "rsy", "re", "rwr", "wy", "hp", "hy"];
export const SIM_KEYS = ["wr", "lhp", "lhr", "lhy", "lk", "lap", "lar", "rhp", "rhr", "rhy", "rk", "rap", "rar", "tx", "tz"];
export const ALL_KEYS = [...ROBOT_KEYS, ...SIM_KEYS];
export const JMAP = {
  lsp: "left_shoulder_pitch", lsr: "left_shoulder_roll", lsy: "left_shoulder_yaw", le: "left_elbow", lwr: "left_wrist_roll",
  rsp: "right_shoulder_pitch", rsr: "right_shoulder_roll", rsy: "right_shoulder_yaw", re: "right_elbow", rwr: "right_wrist_roll",
  wy: "waist_yaw", hp: "head_pitch", hy: "head_yaw", wr: "waist_roll",
  lhp: "left_hip_pitch", lhr: "left_hip_roll", lhy: "left_hip_yaw", lk: "left_knee", lap: "left_ankle_pitch", lar: "left_ankle_roll",
  rhp: "right_hip_pitch", rhr: "right_hip_roll", rhy: "right_hip_yaw", rk: "right_knee", rap: "right_ankle_pitch", rar: "right_ankle_roll",
};
// Joint ranges (rad) from Unitree's R1 MJCF (model/r1.json). Head ranges are not in the model: ⚠️ conservative guess.
export const RANGE = {
  lsp: [-3.1416, 2.0944], lsr: [-0.22689, 2.4784], lsy: [-1.9199, 1.9199], le: [-0.97564, 2.1852], lwr: [-1.9199, 1.9199],
  rsp: [-3.1416, 2.0944], rsr: [-2.47849, 0.2268], rsy: [-1.9199, 1.9199], re: [-0.97564, 2.1852], rwr: [-1.9199, 1.9199],
  wy: [-2.618, 2.618], hp: [-0.5, 0.5], hy: [-0.8, 0.8], wr: [-0.5236, 0.5236],
  lhp: [-2.93215, 2.54818], lhr: [-1.0472, 1.74533], lhy: [-2.7402, 2.7402], lk: [-0.174533, 2.42601], lap: [-0.87266, 0.57596], lar: [-0.2618, 0.2618],
  rhp: [-2.93215, 2.54818], rhr: [-1.74533, 1.0472], rhy: [-2.7402, 2.7402], rk: [-0.17453, 2.42601], rap: [-0.87266, 0.57596], rar: [-0.261799, 0.261799],
  tx: [-3.2, 3.2], tz: [-3.2, 3.2],
};
// Speed caps (rad/s). r1ctl r1_arm: movej clamps to 1.5, hard cap 2.0 per tick. Our yoga cap is stricter.
export const CAP = { arm: 1.0, r1ctlMovej: 1.5, r1ctlHard: 2.0 };
