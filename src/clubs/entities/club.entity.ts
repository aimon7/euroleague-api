import { Nullable } from 'src/shared/types/nullable';

export class Club {
  code: string;
  name: string;
  alias: string;
  isVirtual: boolean;
  country: {
    code: string;
    name: string;
  };
  address: Nullable<string>;
  website: Nullable<string>;
  ticketsUrl: Nullable<string>;
  twitterAccount: Nullable<string>;
  instagramAccount: Nullable<string>;
  facebookAccount: Nullable<string>;
  venue: {
    name: Nullable<string>;
    code: Nullable<string>;
    capacity: Nullable<number>;
    address: Nullable<string>;
    images: { [key: string]: string };
    active: boolean;
    notes: Nullable<string>;
  };
  venueBackup: Nullable<string>;
  nationalCompetitionCode: Nullable<string>;
  city: Nullable<string>;
  president: Nullable<string>;
  phone: Nullable<string>;
  fax: Nullable<string>;
  images: { [key: string]: string };
}
