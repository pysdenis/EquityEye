interface Address {
	address1: string;
	state: string;
	city: string;
	postal_code: string;
}

export interface CompanyInfo {
	ticker: string;
	name: string;
	locale: string;
	market_cap: string;
	phone_number: string;
	address: Address;
	description: string;
	homepage_url: string;
	total_employees: string;
	list_date: string;
	logo: string;
	share_class_shares_outstanding: string;
	weighted_shares_outstanding: string;
	round_lot: string;
}
