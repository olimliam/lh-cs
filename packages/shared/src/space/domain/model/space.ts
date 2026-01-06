export class Space {
  id!: string;
  isAvailable!: boolean;
  useReservation!: boolean;
  useScreenShareCanvas!: boolean;
  createDate!: string;
  updatedDate!: string;

  constructor(props: Space) {
    Object.assign(this, props);
  }
}
