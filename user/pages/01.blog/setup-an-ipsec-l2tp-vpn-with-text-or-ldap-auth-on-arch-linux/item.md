---
title: "Setup an IPSec L2TP VPN with text or LDAP auth on Arch Linux"
published: true
date: 03/19/2014 11:00pm
taxonomy:
    category: blog
    tag: [sysadmin, archlinux, vpn]
---

Many people around are using openvpn as a secured gateway. But if you want to support all devices out there, it may not be the best choice. Here is a quick how-to on running an IPSec tunnel on Arch Linux.

===

## Configure AUR & install packages

Edit `/etc/pacman.conf` and add the AUR repository :

    [archlinuxfr]
    SigLevel = Never
    Server = http://repo.archlinux.fr/x86_64
    
Update pacman internal database :

    pacman -Ssy
    
Install the AUR package manager yaourt :

    pacman -S yaourt
    
Install the needed packages :

    yaourt -S vim openswan xl2tpd ppp lsof python2
    
And wait for the openswan compilation to finish !

## Setup Routing & Firewall

To have our routing ready at the machine boot, let's create a script that will be launched through `systemctl`.

    touch /usr/local/bin/vpn.sh
    chmod /usr/local/bin/vpn.sh
    vim /usr/local/bin/vpn.sh

And paste the following content : 

    #!/usr/bin/env bash

    echo "net.ipv4.ip_forward = 1" |  tee -a /etc/sysctl.conf
    echo "net.ipv4.conf.all.accept_redirects = 0" |  tee -a /etc/sysctl.conf
    echo "net.ipv4.conf.all.send_redirects = 0" |  tee -a /etc/sysctl.conf
    echo "net.ipv4.conf.default.rp_filter = 0" |  tee -a /etc/sysctl.conf
    echo "net.ipv4.conf.default.accept_source_route = 0" |  tee -a /etc/sysctl.conf
    echo "net.ipv4.conf.default.send_redirects = 0" |  tee -a /etc/sysctl.conf
    echo "net.ipv4.icmp_ignore_bogus_error_responses = 1" |  tee -a /etc/sysctl.conf
    
    for vpn in /proc/sys/net/ipv4/conf/*; do
      echo 0 > $vpn/accept_redirects;
      echo 0 > $vpn/send_redirects;
    done
      
    iptables --table nat --append POSTROUTING --jump MASQUERADE

    sysctl -p
    
Create the systemd rule : 

    vim /etc/systemd/system/vpn.service

And add its config : 

    [Unit]
    Description=IPSec VPN
    After=netctl@eth0.service
    Before=openswan.service xl2tpd.service

    [Service]
    ExecStart=/usr/local/bin/vpn-boot.sh

    [Install]
    WantedBy=multi-user.target 
    
Don't forget to update `eth1` if it's not your interface alias.

And activate the service : 

  <s></s>ystemctl enable vpn.service
    
## Configure the IPSec daemon, Openswan

Edit `/etc/ipsec.conf` and paste the following content (keep the indentation and replace `xxx.xxx.xxx.xxx` with your server external IP) :

    config setup
            dumpdir=/var/run/pluto/
            #in what directory should things started by setup (notably the Pluto daemon) be allowed to dump core?
            nat_traversal=yes
            #whether to accept/offer to support NAT (NAPT, also known as "IP Masqurade") workaround for IPsec
            virtual_private=%v4:10.0.0.0/8,%v4:192.168.0.0/16,%v4:172.16.0.0/12,%v6:fd00::/8,%v6:fe80::/10
            #contains the networks that are allowed as subnet= for the remote client. In other words, the address ranges that may live behind a NAT router through which a client connects.
            protostack=netkey
            #decide which protocol stack is going to be used.

    conn L2TP-PSK-NAT
            rightsubnet=vhost:%priv
            also=L2TP-PSK-noNAT

    conn L2TP-PSK-noNAT
            authby=secret
            #shared secret. Use rsasig for certificates.
            pfs=no
            #Disable pfs
            auto=add
            #start at boot
            keyingtries=3
            #Only negotiate a conn. 3 times.
            ikelifetime=8h
            keylife=1h
            type=transport
            #because we use l2tp as tunnel protocol
            left=xxx.xxx.xxx.xxx
            #fill in server IP above
            leftprotoport=17/1701
            right=%any
            rightprotoport=17/%any
            
As we will be using a Pre-Shared Key authentification, edit `/etc/ipsec.secrets` and add the following line : 

    xxx.xxx.xxx.xxx  %any:   PSK "mysupersecretkey"
    
Again, replace the x's with your server IP address.

Now relaunch the openswan daemon : 

    systemctl enable openswan && systemctl restart openswan
    
To check if everything is alright, launch :

    ipsec verify
    
You should have the following output :

    Version check and ipsec on-path                     [OK]
    Openswan U2.6.41/K3.8.4-1-ARCH (netkey)
    See `ipsec --copyright' for copyright information.
    Checking for IPsec support in kernel                [OK]
     NETKEY: Testing XFRM related proc values
             ICMP default/send_redirects                [OK]
             ICMP default/accept_redirects              [OK]
             XFRM larval drop                           [OK]
    Hardware random device check                        [N/A]
    Checking rp_filter                                  [ENABLED]
     /proc/sys/net/ipv4/conf/eth0/rp_filter             [ENABLED]
    Checking that pluto is running                      [OK]
     Pluto listening for IKE on udp 500                 [OK]
     Pluto listening for IKE on tcp 500                 [NOT IMPLEMENTED]
     Pluto listening for IKE/NAT-T on udp 4500          [OK]
     Pluto listening for IKE/NAT-T on tcp 4500          [NOT IMPLEMENTED]
     Pluto listening for IKE on tcp 10000 (cisco)       [NOT IMPLEMENTED]
    Checking NAT and MASQUERADEing                      [TEST INCOMPLETE]
    Checking 'ip' command                               [OK]
    Checking 'iptables' command                         [OK]


## Configure L2TP via xl2tpd

Editez le fichier `/etc/xl2tpd/xl2tpd.conf` and add this content : 

    [global]
    ipsec saref = yes
    saref refinfo = 30
    auth file = /etc/xl2tpd/l2tp-secrets
    
    [lns default]
    ip range = 172.16.1.30-172.16.1.100
    local ip = 172.16.1.1
    refuse pap = yes
    require authentication = yes
    ppp debug = yes
    pppoptfile = /etc/ppp/options.xl2tpd
    length bit = yes
    
Edit the IP range if your want your virtual addresses to run on another IPs.

Create the folder that xl2tpd will use to store its PID file :

    mkdir /var/run/xl2tpd/
    
Edit the L2TP secret file `/etc/xl2tpd/l2tp-secrets` and add your PSK :

    *    *    "mysupersecretkey"    *

## Authentification
### Via text-file

Edit thee PPP for xl2tpd config `/etc/ppp/options.xl2tpd` :

    require-mschap-v2
    ms-dns 8.8.8.8
    ms-dns 8.8.4.4
    auth
    mtu 1200
    mru 1000
    crtscts
    hide-password
    modem
    name l2tpd
    proxyarp
    lcp-echo-interval 30
    lcp-echo-failure 4
  
You can put your own DNS if you want to.

We will now add our user to `/etc/ppp/chap-secrets` : 

    # Secrets for authentication using CHAP
    # client server secret IP addresses
    myusername   l2tpd   mypassword       *
    
To prevent an odd Arch misconfiguration, symlink `pppd` to `/usr/sbin` :

    ln -s /usr/bin/pppd /usr/sbin/pppd
    
### Via Radius/LDAP

Coming soon.

## Restart everything

Restart your services and enjoy !

    systemctl restart openswan
    systemctl restart xl2tpd
    
You can monitor any errors through :

    journalctl -f