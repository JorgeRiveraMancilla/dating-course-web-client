export interface Photo {
  id: number;
  url: string;
  isMain: boolean;
  isApproved: boolean;
  publicId: string;
  userId: number;
}
