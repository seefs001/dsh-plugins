import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  classifyLinuxMachine,
  classifyMacModel,
  detectHostMachineKind,
  parseMacIoregProductName,
  resolveHostname,
} from '../lib/machine.js'

test('resolveHostname trims whitespace, strips .local suffix, and returns null for blank', () => {
  assert.equal(resolveHostname('dev-mac.local'), 'dev-mac')
  assert.equal(resolveHostname('  build-box  '), 'build-box')
  assert.equal(resolveHostname('   '), null)
  assert.equal(resolveHostname('.local'), null)
})

test('classifyMacModel maps Apple hardware names to Paseo HostMachineKind values', () => {
  assert.equal(classifyMacModel('MacBook Pro'), 'laptop')
  assert.equal(classifyMacModel('MacBookAir10,1'), 'laptop')
  assert.equal(classifyMacModel('Mac mini'), 'mini')
  assert.equal(classifyMacModel('Macmini9,1'), 'mini')
  assert.equal(classifyMacModel('iMac21,1'), 'desktop')
  assert.equal(classifyMacModel('Mac Studio'), 'workstation')
  assert.equal(classifyMacModel('MacPro7,1'), 'workstation')
  assert.equal(classifyMacModel('Mac15,6'), null)
  assert.equal(classifyMacModel(null), null)
})

test('parseMacIoregProductName extracts product-name and falls back to model', () => {
  assert.equal(
    parseMacIoregProductName('  "product-name" = <"MacBook Pro">\n  "model" = <"Mac15,6">'),
    'MacBook Pro',
  )
  assert.equal(
    parseMacIoregProductName('  "model" = <"Macmini9,1">'),
    'Macmini9,1',
  )
  assert.equal(parseMacIoregProductName('no fields'), null)
})

test('classifyLinuxMachine detects containers, WSL, boards, cloud/VMs, and chassis types', () => {
  const base = {
    hasContainerMarker: false,
    procVersion: null,
    deviceTreeModel: null,
    sysVendor: null,
    productName: null,
    biosVendor: null,
    boardVendor: null,
    chassisType: null,
  }
  assert.equal(classifyLinuxMachine({ ...base, hasContainerMarker: true }), 'container')
  assert.equal(classifyLinuxMachine({ ...base, procVersion: 'Linux version 6.6.0-microsoft-standard-WSL2' }), 'desktop')
  assert.equal(classifyLinuxMachine({ ...base, deviceTreeModel: 'Raspberry Pi 5 Model B' }), 'board')
  assert.equal(classifyLinuxMachine({ ...base, sysVendor: 'Amazon EC2', productName: 'c7g.xlarge' }), 'cloud')
  assert.equal(classifyLinuxMachine({ ...base, biosVendor: 'QEMU' }), 'cloud')
  assert.equal(classifyLinuxMachine({ ...base, chassisType: '10' }), 'laptop')
  assert.equal(classifyLinuxMachine({ ...base, chassisType: '35' }), 'mini')
  assert.equal(classifyLinuxMachine({ ...base, chassisType: '3' }), 'desktop')
  assert.equal(classifyLinuxMachine({ ...base, chassisType: '23' }), 'server')
  assert.equal(classifyLinuxMachine(base), null)
})

test('detectHostMachineKind returns null on unsupported platforms', async () => {
  assert.equal(await detectHostMachineKind('win32'), null)
})
