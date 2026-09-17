export type ProfileLinks = {
    readonly github: string;
    readonly linkedin: string;
};

export type Profile = {
    readonly name: string;
    readonly professionalTitle: string;
    readonly email: string;
    readonly availabilityStatus: string;
    readonly links: ProfileLinks;
};
