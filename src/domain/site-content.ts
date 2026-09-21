export type HeroContent = {
    readonly roles: readonly string[];
};

export type Education = {
    readonly id: string;
    readonly institution: string;
    readonly program: string;
    readonly startYear: number;
    readonly endYear: number;
};

export type AboutContent = {
    readonly label: string;
    readonly heading: string;
    readonly intro: string;
    readonly story: readonly string[];
    readonly beyondCode: readonly string[];
    readonly currentFocus: readonly string[];
    readonly currentFocusSummary: string;
    readonly strengths: readonly string[];
    readonly education: readonly Education[];
};

export type CurrentWorkContent = {
    readonly primaryWork: string;
    readonly buildLog: readonly string[];
    readonly clientWork: readonly string[];
    readonly focus: readonly string[];
};

export type SiteContent = {
    readonly hero: HeroContent;
    readonly about: AboutContent;
    readonly currentWork: CurrentWorkContent;
};
