export interface SidenavMenu {
  displayName: string;
  disabled?: boolean;
  iconName: string;
  route?: string;
  children?: SidenavMenu[];
}
