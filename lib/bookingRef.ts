import { customAlphabet } from "nanoid";

// no 0/1/I/O
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const createBookingReference = customAlphabet(alphabet, 10);
