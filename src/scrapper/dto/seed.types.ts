export namespace Seed {
  export interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    size: number;
    httpOnly: boolean;
    secure: boolean;
    session: boolean;
    sameSite?: unknown;
    priority: unknown;
    sameParty: boolean;
    sourceScheme: unknown;
    sourcePort: number;
    partitionKey?: string;
    partitionKeyOpaque?: boolean;
  }

  export interface AuthVerify {
    authenticationIsValid: boolean;
    cookies: Cookie[];
  }

  export interface FullAppointment {
    Worksheet: null;
    Require: null;
    Evaluate: null;
    TotalRows: number;
    PageSize: number;
    Table: null;
    Id: number;
    IdRequire: null;
    IdCustomer: number;
    CustomerName: null;
    IdProject: number;
    ProjectName: null;
    StartDate: null;
    EndDate: null;
    IdCell: number;
    CellName: null;
    IdCategory: number;
    IdManager: number;
    IdDeveloper: number;
    IsMaster: boolean;
    IdAncestor: number;
    DeveloperName: null;
    HourValue: null;
    ExtraValue: null;
    CategoryName: null;
    InformedDate: string;
    Created: null;
    StartTime: string;
    EndTime: string;
    TotalTime: null;
    NotMonetize: boolean;
    Description: string;
    CommitRepository: string | null;
    IsDeleted: boolean;
    TotalTimeInProject: null;
    ConsumedTimeInProject: null;
    IdEvaluate: null;
    IsApprove: null;
    IsReprove: null;
    IsReview: null;
    IsWait: null;
    IsPreApproved: null;
    TimePreApproved: null;
    UserPreApproved: null;
    IsPaid: boolean;
    ConsumedTimeInProjectExceded: boolean;
    TimeInWorksheetExceded: number;
    IsEvaluate: boolean;
    TypeReport: null;
    SumTotalTime: null;
    TotaltimeInMinutes: number;
    IdCustomerPreSelected: null;
    IdProjectPreSelected: null;
    IdDeveloperPreSelected: null;
    IsEvaluatePreSelected: boolean;
  }

  export interface Appointment {
    id: string;
    cliente: string;
    projeto: string;
    categoria: string;
    data: string;
    horaInicial: string;
    horaFinal: string;
    descricao: string;
    naoContabilizado: boolean;
    avaliacao: string;
    commit: string;
  }

  export interface Client {
    id: string;
    title: string;
  }

  export interface Project {
    Id: number;
    Name: string;
    StartDate: string;
    EndDate: string;
    IdCustomer: number;
  }

  export interface Category {
    Id: number;
    Name: string;
    IdProject: number;
  }

  export interface ProjectProgress {
    Id: number;
    IdCell: null;
    CellName: null;
    IdCustomer: number;
    CustomerName: string;
    IdProject: number;
    ProjectName: string;
    IsMaintenance: boolean;
    HourLimitPerMonth: null;
    Budget: number;
    NotMonetize: boolean;
    StartDate: string;
    EndDate: string;
    TotalTime: string;
    TotalTimeMounth: string;
    TotalTimeInProject: string;
    ConsumedTimeInProject: string;
  }
}
